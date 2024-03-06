import { Address, AddressDocument } from "../models/address.schema";
import { AbstractService } from "./abstract.service";

export class AddressService extends AbstractService<AddressDocument> {
  constructor() {
    super(Address);
  }
}
