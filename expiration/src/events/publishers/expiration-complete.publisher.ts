import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@nk-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
