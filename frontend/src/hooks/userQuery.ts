import { useQuery } from '@tanstack/react-query';
import UserService from '../utils/api/UserService';

export const useUsers = () => {
  const {
    data: users,
    isError,
    isLoading,
    error,
  } = useQuery(['users'], async () => {
    const response = await UserService.getCurrent();
    if (response.success) {
      return response.data;
    } else {
      return {} as any;
    }
  });
  return { users, isError, isLoading, error };
};
