import * as React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

type SlugMode = 'auto' | 'manual';

interface useAutoSlugOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  nameField: Path<T>;
  slugField: Path<T>;
  generateSlug: (value: string) => string;
  debounceMs?: number;
}

export function useAutoSlug<T extends FieldValues>({
  form,
  nameField,
  slugField,
  generateSlug,
  debounceMs = 300,
}: useAutoSlugOptions<T>) {
  const [mode, setMode] = React.useState<SlugMode>('auto');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSlug = React.useCallback(
    (value: string) => {
      form.setValue(slugField, value as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form, slugField],
  );

  const generateAndSet = React.useCallback(
    (name: string) => {
      const slug = generateSlug(name);
      setSlug(slug);
    },
    [generateSlug, setSlug],
  );

  const onNameChange = React.useCallback(
    (name: string) => {
      if (mode !== 'auto') return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        generateAndSet(name);
      }, debounceMs);
    },
    [mode, debounceMs, generateAndSet],
  );

  const onSlugChange = React.useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setMode('manual');
  }, []);

  const resetToAuto = React.useCallback(() => {
    setMode('auto');
    const name = form.getValues(nameField);
    generateAndSet(name);
  }, [form, nameField, generateAndSet]);

  return {
    mode,
    onNameChange,
    onSlugChange,
    resetToAuto,
    isAuto: mode === 'auto',
    isManual: mode === 'manual',
  };
}
