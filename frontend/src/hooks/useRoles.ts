// Role hook

import { useQuery } from '@tanstack/react-query';
import RoleService from '../utils/api/RoleService';

export const useRoles = () => {
  const {
    data: roles,
    isError,
    isLoading,
  } = useQuery(['roles'], async () => {
    const response = await RoleService.getAll();
    if (response.success) {
      return response.data;
    } else {
      return [];
    }
  });
  return { roles, isError, isLoading };
};
