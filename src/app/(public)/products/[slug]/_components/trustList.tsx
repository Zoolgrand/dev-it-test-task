import type { ReactElement } from "react";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";

const guarantees = [
  {
    Icon: Truck,
    title: catalogMessages.deliveryTitle,
    note: catalogMessages.deliveryNote,
  },
  {
    Icon: CreditCard,
    title: catalogMessages.paymentTitle,
    note: catalogMessages.paymentNote,
  },
  {
    Icon: ShieldCheck,
    title: catalogMessages.warrantyTitle,
    note: catalogMessages.warrantyNote,
  },
];

export function TrustList(): ReactElement {
  return (
    <ul className="flex flex-col gap-space-sm pt-space-xs">
      {guarantees.map(({ Icon, title, note }) => (
        <li key={title} className="flex items-start gap-space-sm">
          <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <span className="flex flex-col">
            <span className="text-label-md text-on-surface">{title}</span>
            <span className="text-body-sm text-on-surface-variant">{note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
