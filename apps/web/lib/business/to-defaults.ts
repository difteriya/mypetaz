import type { BusinessDefaults } from '@/components/business/business-profile-form';
import { parseBusinessHours } from './hours';
import type { MyBusiness } from './data';

export const EMPTY_BUSINESS_DEFAULTS: BusinessDefaults = {
  name: '',
  description: '',
  cityId: '',
  address: '',
  lat: '',
  lng: '',
  phone: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  website: '',
  hours: {},
  banner: null,
  logo: null,
};

export function toBusinessDefaults(b: MyBusiness): BusinessDefaults {
  const social = (b.socialLinks ?? {}) as Record<string, string>;
  return {
    name: b.name,
    description: b.description ?? '',
    cityId: b.cityId ?? '',
    address: b.address ?? '',
    lat: b.lat?.toString() ?? '',
    lng: b.lng?.toString() ?? '',
    phone: b.phone ?? '',
    instagram: social.instagram ?? '',
    facebook: social.facebook ?? '',
    tiktok: social.tiktok ?? '',
    website: social.website ?? '',
    hours: parseBusinessHours(b.businessHours),
    banner: b.banner,
    logo: b.logo,
  };
}
