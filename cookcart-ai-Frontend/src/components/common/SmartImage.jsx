import { useEffect, useMemo, useState } from 'react';
import {
  getIngredientImageUrl,
  getProductImageUrl,
  getRecipeImageUrl,
} from '../../utils/imageUtils.js';

export default function SmartImage({ src, alt = '', kind = 'recipe', fallback, className = '', loading = 'lazy', ...rest }) {
  const resolved = useMemo(() => {
    if (kind === 'product') return getProductImageUrl(src);
    if (kind === 'ingredient') return getIngredientImageUrl(src);
    return getRecipeImageUrl(src);
  }, [src, kind]);
  const [current, setCurrent] = useState(resolved);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(resolved);
    setFailed(false);
  }, [resolved]);

  const safeFallback = fallback || getRecipeImageUrl({ name: 'food' });
  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      draggable={false}
      className={className}
      {...rest}
      onError={() => {
        if (!failed) {
          setFailed(true);
          setCurrent(safeFallback);
        }
      }}
    />
  );
}
