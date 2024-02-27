import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isNotNumber' })
export class IsNotNumberConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, validationArguments: ValidationArguments): Promise<boolean> | boolean {
    // Check if the value is a number using `typeof`
    return typeof value !== 'number';
  }
}

export function IsNotNumber(validationOptions?: object): ValidatorConstraint {
  return new IsNotNumberConstraint(validationOptions);
}
