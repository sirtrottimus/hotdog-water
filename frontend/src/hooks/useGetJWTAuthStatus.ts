// JWTAuth hook

import { useQuery } from '@tanstack/react-query';
import JWTAuthService from '../utils/api/JWTAuthService';

export const useJWTAuth = () => {
  const {
    data: jwtAuth,
    isError,
    isLoading,
  } = useQuery(['jwtAuth'], async () => {
    const response = await JWTAuthService.getActive();
    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  });
  return { jwtAuth, isError, isLoading };
};
