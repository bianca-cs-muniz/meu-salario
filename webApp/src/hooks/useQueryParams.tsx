/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

type QueryParams = Record<string, string | undefined>;

const useQueryParams = () => {
  const [searchParams] = useSearchParams();
  const parametros = useParams();
  const [queryParams, setQueryParams] = useState(new URLSearchParams(searchParams));

  const navigate = useNavigate();

  useEffect(() => {
    setQueryParams(new URLSearchParams(searchParams)!);
  }, [searchParams]);

  const getParam = (key: string): string | null => searchParams.get(key);

  const setParam = (key: string, value: string | null | undefined): void => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const limpaSearch = () => {
    navigate(location.pathname, { replace: true });
  };

  const setParams = (params: Record<string, string | null | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const criaParams = (params: any) => {
    return new URLSearchParams(params).toString();
  };

  const removeParams = (...keys: string[]): void => {
    const newParams = new URLSearchParams(searchParams);
    keys.forEach((key) => newParams.delete(key));
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const resetParams = (params: QueryParams = {}): void => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        newParams.set(key, value);
      }
    });
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  return { getParam, setParam, removeParams, resetParams, setParams, parametros, criaParams, searchParams, queryParams, limpaSearch, navigate };
};

export default useQueryParams;
