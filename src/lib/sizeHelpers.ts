import { standardSizes } from "./pricing";
import { CUSTOM_SIZE_IDX } from "@/components/wizard/types";

/**
 * Resolve the actual print dimensions from wizard state.
 * Works with both standard sizes (sizeIdx >= 0) and custom sizes (sizeIdx === CUSTOM_SIZE_IDX).
 */
export function resolveSize(sizeIdx: number, customWidth: number, customHeight: number) {
  if (sizeIdx === CUSTOM_SIZE_IDX) {
    return {
      w: customWidth,
      h: customHeight,
      label: `${customWidth}"×${customHeight}"`,
    };
  }
  return standardSizes[sizeIdx];
}
