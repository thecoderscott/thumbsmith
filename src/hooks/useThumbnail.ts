import { useCallback, useMemo, useState } from "react";
import { FormData } from "../types/FormTypes";
import { initialFormState } from "../utils/initialFormState";

interface UseThumbnailReturn {
  formData: FormData;
  onHandleFieldUpdate: (fieldName: keyof FormData, value: any) => void;
  onHandleReset: () => void;
}

export const useThumbnail = (): UseThumbnailReturn => {
  const [formData, setFormData] = useState<FormData>(initialFormState);

  const onHandleFieldUpdate = useCallback((fieldName: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, [formData]);

  const onHandleReset = useCallback(() => {
    setFormData(initialFormState);
  }, []);

  return useMemo(() => ({
    formData,
    onHandleFieldUpdate,
    onHandleReset,
  }), [
    formData,
    onHandleFieldUpdate,
    onHandleReset,
  ]);
}
