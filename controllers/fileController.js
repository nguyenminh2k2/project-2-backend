var ImageKit = require("imagekit");

var imagekit = new ImageKit({
    publicKey : "public_I6wUAAxRlI3FAHU1crKlt06uUpw=",
    privateKey : "private_wk96kdD5BDSAPaABtDT5WymRyVE=",
    urlEndpoint : "https://ik.imagekit.io/minhnt204587"
});

const fileController = {
    imageUpload: async (req, res) => {
        var fileData = null;
        switch (req.body.Type) {
            case 1:
                fileData = req.body.Url;
                break;
            case 2:
                fileData = req.body.File;
            default:
                fileData = req.body.File;
                break;
        }
        if (fileData) {
            try {
                let uploadResponse = await imagekit.upload({
                    file: fileData,
                    fileName: req.body.FileName,
                    folder: req.body.Folder,
                    tags: req.body.Tags
                })
                return res.status(200).json(uploadResponse);
            } catch(err) {
                return res.status(500).json(`ERROR: ${err}`);
            }
        } else {
            return res.status(400).json('File is required !!!');
        }
    }
}
module.exports = fileController;