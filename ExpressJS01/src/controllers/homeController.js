const getHomepage = async (req, res) => {
    try {
        return res.render('index.ejs');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Lỗi máy chủ');
    }
};

module.exports = {
    getHomepage,
};