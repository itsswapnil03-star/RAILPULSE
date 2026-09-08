/**
 * MapLoader.jsx — thin dynamic-import wrapper for RailMap.
 * Avoids SSR issues with Leaflet and defers the heavy bundle.
 */
import { lazy, Suspense } from "react";
import LoadingState from "./LoadingState";

export default function dynamic(factory) {
  const Component = lazy(factory);
  return function DynamicComponent(props) {
    return (
      <Suspense fallback={<LoadingState label="Loading map…" />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
