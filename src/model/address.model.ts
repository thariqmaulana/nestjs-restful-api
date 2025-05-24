export class AddressResponse {
  id: number;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  country: string;
  postal_code: string;
}

export class CreateAddressRequest {
  contact_id: number;
  street?: string | null;
  city?: string | null;
  country: string;
  province?: string | null;
  postal_code: string;
}

export class GetAddressRequest {
  address_id: number;
  contact_id: number;
}

export class UpdateAddressRequest {
  address_id: number;
  contact_id: number;
  street?: string | null;
  city?: string | null;
  country: string;
  province?: string | null;
  postal_code: string;
}

export class RemoveAddressRequest {
  address_id: number;
  contact_id: number;
}
