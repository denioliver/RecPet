// useNavigateHook.ts
import { useNavigate } from 'react-router-dom';

const useNavigationHook = () => {
  const navigate = useNavigate();

  const goTo = (path: string, state?: unknown) => {
    navigate(path, { state });
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return {
    goTo,
    goBack,
    goForward,
  };
};

export default useNavigationHook;
