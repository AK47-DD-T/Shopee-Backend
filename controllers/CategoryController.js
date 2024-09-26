const { model } = require("mongoose");
const { SubCategory, Category } = require("../models/Assosiations");
const sequelize = require("../config/database");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching Categories: ", error);
    res.status(500).json({ message: error.message || error });
  }
};

const getSubCategories = async (req, res) => {
  const { category_id } = req.params;
  try {
    const subCategories = await SubCategory.findAll({
      where: {
        category_id,
      },
    });
    const totalProductEverySubCategoryQuery = `SELECT sub_category.sub_category_id, count(product.product_id) as totalProduct FROM sub_category inner join product on product.sub_category_id = sub_category.sub_category_id WHERE sub_category.category_id = ${category_id} group by sub_category_id;`;

    const totalProductEverySubCategory = await sequelize.query(
      totalProductEverySubCategoryQuery,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    subCategories.forEach((subCategory) => {
      if (totalProductEverySubCategory.length > 0) {
        const found = totalProductEverySubCategory.find(
          (item) => item.sub_category_id === subCategory.sub_category_id
        );
        if (found) {
          subCategory.dataValues.totalProduct = found.totalProduct;
        } else {
          subCategory.dataValues.totalProduct = 0;
        }
      }
    });

    subCategories.sort((a, b) =>
      b.dataValues.totalProduct > a.dataValues.totalProduct ? 0 : -1
    );

    res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Error fetching SubCategories: ", error);
    res.status(500).json({ error: true, message: error.message || error });
  }
};

const getAllCategoriesWithSubCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: SubCategory,
        },
      ],
    });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message || error,
    });
  }
};

module.exports = {
  getAllCategories,
  getAllCategoriesWithSubCategories,
  getSubCategories,
};
