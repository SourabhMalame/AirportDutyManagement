import {INCENTIVE_AMOUNT, INCENTIVE_TYPES} from '../constants/dutyFormFields';

export const isIncentiveEligible = officeType =>
  INCENTIVE_TYPES.includes(officeType);

export const calculateTotalIncentive = (duties = []) =>
  duties.filter(d => isIncentiveEligible(d.officeType) && d.status === 'COMPLETED').length * INCENTIVE_AMOUNT;
