import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Helper to generate clean slug
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all products with full filtering, search, sorting & pagination
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      roastLevel,
      origin,
      coffeeType,
      minPrice,
      maxPrice,
      rating,
      inStock,
      featured,
      bestSeller,
      sale,
      sort = 'featured',
      page = 1,
      limit = 12
    } = req.query;

    const query: any = {};

    // Text / Keyword Search
    if (search) {
      const regex = new RegExp(search as string, 'i');
      query.$or = [
        { name: regex },
        { shortDescription: regex },
        { description: regex },
        { origin: regex },
        { category: regex },
        { tastingNotes: regex },
        { tags: regex }
      ];
    }

    // Category Filter
    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // Roast Level Filter
    if (roastLevel && roastLevel !== 'all') {
      const roasts = (roastLevel as string).split(',');
      query.roastLevel = { $in: roasts };
    }

    // Origin Filter
    if (origin && origin !== 'all') {
      query.origin = new RegExp(origin as string, 'i');
    }

    // Coffee Type Filter
    if (coffeeType && coffeeType !== 'all') {
      const types = (coffeeType as string).split(',');
      query.coffeeType = { $in: types };
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // In Stock Only Filter
    if (inStock === 'true') {
      query.inventory = { $gt: 0 };
    }

    // Featured / Best Seller Flags
    if (featured === 'true') {
      query.featured = true;
    }
    if (bestSeller === 'true') {
      query.bestSeller = true;
    }

    // On Sale Filter
    if (sale === 'true') {
      query.salePrice = { $gt: 0, $ne: null };
    }

    // Sorting
    let sortOption: any = { featured: -1, createdAt: -1 };
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'best-selling':
        sortOption = { bestSeller: -1, reviewCount: -1 };
        break;
      case 'best-rated':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'featured':
      default:
        sortOption = { featured: -1, bestSeller: -1, createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      limit: pageSize,
      products
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Fetch related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('name slug price salePrice images rating reviewCount category badge roastLevel shortDescription');

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    res.status(200).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      category,
      shortDescription,
      description,
      price,
      salePrice,
      sku,
      inventory,
      roastLevel,
      origin,
      coffeeType,
      tastingNotes,
      brewingMethod,
      processingMethod,
      elevation,
      variants,
      images,
      badge,
      featured,
      bestSeller,
      tags
    } = req.body;

    if (!name || !category || !description || !price || !sku) {
      res.status(400).json({ success: false, message: 'Please provide all required product fields.' });
      return;
    }

    let slug = slugify(name);
    // Check if slug exists, append random if needed
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const defaultImages = images && images.length > 0 ? images : ['/images/coffee.jpg'];

    const product = await Product.create({
      name,
      slug,
      category,
      shortDescription: shortDescription || description.slice(0, 120),
      description,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      sku: sku.toUpperCase().trim(),
      inventory: Number(inventory ?? 50),
      roastLevel: roastLevel || 'Medium',
      origin: origin || 'Single Origin',
      coffeeType: coffeeType || 'Single Origin',
      tastingNotes: Array.isArray(tastingNotes) ? tastingNotes : (tastingNotes ? tastingNotes.split(',').map((t: string) => t.trim()) : []),
      brewingMethod: Array.isArray(brewingMethod) ? brewingMethod : (brewingMethod ? brewingMethod.split(',').map((b: string) => b.trim()) : ['Pour Over', 'Drip']),
      processingMethod: processingMethod || '',
      elevation: elevation || '',
      variants: variants && variants.length > 0 ? variants : [
        { id: 'v1', weight: '250g', grind: 'Whole Bean', price: Number(price), sku: `${sku}-250G-WB`, stock: 25 },
        { id: 'v2', weight: '500g', grind: 'Whole Bean', price: Number(price) * 1.8, sku: `${sku}-500G-WB`, stock: 15 },
        { id: 'v3', weight: '1kg', grind: 'Whole Bean', price: Number(price) * 3.4, sku: `${sku}-1KG-WB`, stock: 10 }
      ],
      images: defaultImages,
      badge: badge || '',
      featured: Boolean(featured),
      bestSeller: Boolean(bestSeller),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : [])
    });

    // Update category item count
    await Category.updateOne({ slug: category.toLowerCase() }, { $inc: { itemCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    if (req.body.name && req.body.name !== product.name) {
      req.body.slug = slugify(req.body.name);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    await Category.updateOne({ slug: product.category.toLowerCase() }, { $inc: { itemCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick update product inventory (Admin)
// @route   PATCH /api/products/:id/inventory
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { inventory } = req.body;
    if (inventory === undefined || inventory < 0) {
      res.status(400).json({ success: false, message: 'Valid non-negative inventory number required.' });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { inventory: Number(inventory) },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully.',
      inventory: product.inventory
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
