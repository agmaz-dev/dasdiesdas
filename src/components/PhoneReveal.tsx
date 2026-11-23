"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export function PhoneReveal({ phone }: { phone: string }) {
  const [show, setShow] = useState(false);
  return show ? (
    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn-outline w-full font-mono"><Icon name="phone" size={18} /> {phone}</a>
  ) : (
    <button type="button" className="btn-outline w-full" onClick={() => setShow(true)}><Icon name="phone" size={18} /> Telefonnummer anzeigen</button>
  );
}
