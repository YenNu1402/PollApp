
const attachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Attachment', attachmentSchema);
