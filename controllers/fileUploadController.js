// controllers/fileUploadController.js
import * as userService from '../services/userService.js';

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Build the full download URL — mirrors Spring's ServletUriComponentsBuilder
    const fileDownloadUri = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const updatedUser = await userService.updateProfilePicture(req.user.id, fileDownloadUri);
    return res.status(200).json({ url: updatedUser.profilePictureUrl });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
