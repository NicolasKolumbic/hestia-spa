import { Component, contentChild, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Button } from '../button/button';
import { ButtonModule } from 'primeng/button';
import { DialogContent } from '@shared/abstractions/dialog/dialog-content';
import { Zone } from 'src/app/core';


@Component({
  selector: 'hta-dialog',
  imports: [DialogModule, Button, ButtonModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class Dialog {
  title = input<string>('');
  show = model<boolean>(false);
  labelConfirm = input<string>('Confirmar');
  labelCancel = input<string>('Cancelar');
  disabledConfirm = input<boolean>(false);

  confirm = output<any>();
  cancel = output<void>();

  content = contentChild<DialogContent>("content");

  confirmHandler(): void {
    if (this.content()) {
      const data = this.content()!.getData();
      this.confirm.emit(data);
    }
    this.show.set(false);
  }

  cancelHandler(): void {
    this.cancel.emit();
    this.show.set(false);
  }
}


