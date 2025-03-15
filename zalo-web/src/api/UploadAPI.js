import { axiosFormData } from '../utils/axiosConfig';

const uploadImage = async (file) => {
  try {
    const { data } = await axiosFormData.post('/api/v1/uploads/image', file);

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const uploadFile = async (file) => {
  try {
    const { data } = await axiosFormData.post('/api/v1/uploads/file', file);

    return data.data;
  } catch (error) {
    console.log(error);
  }
};

const UploadAPI = { uploadFile, uploadImage };

export default UploadAPI;
