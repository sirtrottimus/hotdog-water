// permissions hook
import { useQuery } from '@tanstack/react-query';
import PermissionService from '../utils/api/PermissionService';

export const usePermissions = () => {
  const {
    data: permissions,
    isLoading,
    isError,
  } = useQuery(['permissions'], async () => {
    const response = await PermissionService.getAll();
    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  });

  return { permissions, isLoading, isError };
};
