import Product from '../models/product.model.js'

// 获取所有产品
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json({ success: true, data: products })
    } catch (error) {
        console.error('Error fetching products:', error)
        res.status(500).json({ error: 'Failed to fetch products' })
    }
}

// 创建新产品
export const createProduct = async (req, res) => {
    const product = req.body
    if (!product.name || !product.price || !product.title) {
        return res.status(400).json({ error: 'Missing required fields' })
    }
    const newProduct = new Product(product)
    try {
        await newProduct.save()
        res.status(201).json({ success: true, data: newProduct })
    } catch (error) {
        console.error('Error creating product:', error)
        res.status(500).json({ error: 'Failed to create product' })
    }
}

// 更新产品
export const updateProduct = async (req, res) => {
    const { id } = req.params
    const updateData = req.body
    
    if (!updateData.name || !updateData.price || !updateData.title) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' })
        }
        
        res.status(200).json({ success: true, data: updatedProduct })
    } catch (error) {
        console.error('Error updating product:', error)
        res.status(500).json({ error: 'Failed to update product' })
    }
}

// 删除产品
export const deleteProduct = async (req, res) => {
    const { id } = req.params
    try {
        await Product.findByIdAndDelete(id)
        res.status(200).json({ success: true, message: 'Product deleted successfully' })
    } catch (error) {
        console.error('Error deleting product:', error)
        res.status(500).json({ error: 'Failed to delete product' })
    }
}
