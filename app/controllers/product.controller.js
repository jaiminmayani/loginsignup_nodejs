// const config = require("../config/auth.config");
const db = require("../models");
const Product = require("../models/product.model");
// const User = userSchema.user;
const Role = db.role;


exports.addProduct = async (req, res) => {
    
    try {
        const newProduct = new Product(req.body);
        newProduct.save(function (err, data) {
            // const savedProduct = await newProduct.save(function (err, data) {
                if (err) {
                    console.log("err", err)
                
                } else {
                    console.log("DATA", data)
                
                    res.send({status: 'success', data: data});
                    console.log(newProduct);
                }
            });
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        // console.log(req.params);
        // console.log(req.body);

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params._id,
            {
                $set: req.body,
            },
            {new: true}
        );
        res.status(200).json(updatedProduct);
        // console.log(updatedProduct, "updated product");
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete( req.params._id );
        res.status(200).json("Product has been deleted");
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.findProduct = async (req, res) => {
    console.log("We are here");

    try {
        const product = await Product.findById(req.params._id);
        if (product) {
            res.status(200).json(product);
            return;
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Error fetching products" });
    }
};

exports.getAll = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
      //   console.log(products, "All products here");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.findAllProduct = async (req, res) => {
  try {
      const { page, limit, sortBy, sortOrder, category = [] } = req.body;
    const skip = (page - 1) * limit;

    // Prepare the filter
    const filter = {};
    if (category.length > 0) {
      filter.categories = {$in : category};
    }

    // Prepare the sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch the products based on the filter, sort, and pagination options
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get the total count of products matching the filter
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};