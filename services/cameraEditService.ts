import { CameraEditRequest, CameraEditResponse } from '../types/camera';
import { addWatermark } from '../utils/image';

export const mockCameraEdit = async (request: CameraEditRequest): Promise<CameraEditResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const watermarkText = `Camera: ${request.camera.focalLengthMm}mm | FOV: ${request.camera.fov}° | ${request.renderPreset}`;
  const afterImageBase64 = await addWatermark(request.subjectImage, watermarkText);

  const response: CameraEditResponse = {
    id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    afterImageBase64,
    createdAt: Date.now(),
  };

  return response;
};
