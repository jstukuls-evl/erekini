"use client";

import { useState } from "react";

import { UrCompanySearch } from "@/components/customers/ur-company-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UrCompanyHit } from "@/lib/ur/types";

export function CustomerForm() {
  const [legalName, setLegalName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");

  function applyUr(hit: UrCompanyHit) {
    setLegalName(hit.legalName);
    setRegistrationNumber(hit.registrationNumber);
    setVatNumber(hit.vatNumber ?? "");
    setAddress(hit.addressLine1 ?? "");
    setCity(hit.city ?? "");
    setPostalCode(hit.postalCode ?? "");
  }

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <UrCompanySearch onSelect={applyUr} />
      <div>
        <Label htmlFor="legalName">Nosaukums</Label>
        <Input
          id="legalName"
          required
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="reg">Reģistrācijas nr.</Label>
          <Input
            id="reg"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="vat">PVN nr.</Label>
          <Input
            id="vat"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Adrese</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">Pilsēta</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="postal">Pasta indekss</Label>
          <Input
            id="postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">E-pasts</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled>
        Saglabāt (Phase 1)
      </Button>
    </form>
  );
}
