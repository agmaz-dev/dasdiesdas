"use client";

/** Select, das beim Ändern das umgebende Formular absendet */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { resetFields?: string[] }) {
  const { resetFields, ...rest } = props;
  return (
    <select
      {...rest}
      onChange={(e) => {
        const form = e.currentTarget.form;
        if (!form) return;
        for (const name of resetFields ?? []) {
          const el = form.elements.namedItem(name);
          if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) el.value = "";
        }
        form.requestSubmit();
      }}
    />
  );
}
