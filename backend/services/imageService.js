const { createClient } = require('@supabase/supabase-js');
const { decode } = require('base64-arraybuffer');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANOKEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const imageService = {
  getSupabaseFileUrl(filePath) {
    if (filePath) {
      return {
        uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
      };
    }
    return null;
  },

  async uploadFile(folderName, fileBase64, isImage = true) {
    try {
      let fileName = this.getFilePath(folderName, isImage);
      let imageData = decode(fileBase64); // array buffer
      
      let { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileName, imageData, {
          cacheControl: "3600",
          upsert: false,
          contentType: isImage ? "image/*" : "video/*",
        });
        
      if (error) {
        console.log("uploadFile error:", error);
        return { success: false, msg: "Could not upload media", error };
      }
      
      return { 
        success: true, 
        data: {
          path: data.path,
          url: this.getSupabaseFileUrl(data.path)
        } 
      };
    } catch (error) {
      console.log("uploadFile error:", error);
      return { success: false, msg: "Could not upload media", error };
    }
  },

  getFilePath(folderName, isImage) {
    return `/${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
  }
};

module.exports = imageService;