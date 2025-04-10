import httpFormData from '../utils/file-request';

const fileService = {
  uploadImage: (body: any): Promise<{ url: string }> =>
    httpFormData.axios.request({
      url: '/api/v1/file/upload',
      method: 'POST',
      data: body,
    }),
};

export default fileService;
