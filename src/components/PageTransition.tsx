import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const positions = new Map<string, number>();

/**
 * Transição suave entre ecrãs + memória de scroll (restaura a posição ao
 * voltar atrás, como numa app nativa). Nunca mostra ecrã branco: o conteúdo
 * anterior só é substituído depois de o novo estar montado.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navType = useNavigationType();
  const key = location.pathname + location.search;
  const prevKey = useRef(key);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    if (prevKey.current !== key) {
      positions.set(prevKey.current, window.scrollY);
      prevKey.current = key;
    }
    setAnim(true);
    const t = window.setTimeout(() => setAnim(false), 240);

    const y = navType === "POP" ? positions.get(key) ?? 0 : 0;
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    return () => window.clearTimeout(t);
  }, [key, navType]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <div key={key} className={anim ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
