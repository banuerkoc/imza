
export interface SignatureData {
  name: string;
  title: string;
  description: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  photoUrl: string;
  logoUrl: string;
  brandColor: string;
  socials: {
    youtube: string;
    instagram: string;
    linkedin: string;
  };
}

export const BRAND_COLORS = [
  { name: 'De Sarı', code: '#FDCD1F' },
  { name: 'Turuncu', code: '#c46713' },
  { name: 'Bordo', code: '#a41e34' },
  { name: 'Koyu Gri', code: '#333333' }
];
