export class PaymentDetail {
  id!: String;
  employeeId!: String;
  firstName!: string;
  lastName!: string;
  state!: string;
  lga!: string;
  facility!: string;
  team!: number;
  designation!: string;
  status!: 'active' | 'inactive';
  fromDate!: Date;
  toDate!: Date;
  daysSelected!: number;
  daysWorked!: number;
  transportPerDay!: number;
  previousTravelAdvance!: number;
  totalTransport!: number;
  numOfPersonsVaccinated!: number;
  numOfVaccinations!: number;
  costPerVaccination!: number;
  totalPbi!: number;
  totalInternetCost!: number;
  total!: number;
  accountNumber!: string;
  accountName!: string;
  bank!: string;
}
