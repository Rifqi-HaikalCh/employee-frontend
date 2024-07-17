export class Employee {
  id?: number;
  firstName: string;
  lastName: string;
  emailId: string;
  dateOfBirth: Date;

  constructor() {
    this.id = undefined;
    this.firstName = '';
    this.lastName = '';
    this.emailId = '';
    this.dateOfBirth = new Date();
  }
}
