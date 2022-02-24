/*
 * Licensed under the TECNOPRO License, Version 1.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.tecnopro.net/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Directive, Input, HostListener, NgModule } from '@angular/core';
import { Table } from 'primeng/table';

@Directive({
  selector: '[pAddRow]'
})

export class AddRowDirective {
  @Input() table: Table;
  @Input() newRow: any;

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    // Insert a new row
    this.table.value.push(this.newRow);

    // Set the new row in edit mode
    this.table.initRowEdit(this.newRow);

    event.preventDefault();
  }
}

@NgModule({
  declarations: [ AddRowDirective ],
  exports: [ AddRowDirective ]
})

export class AddRowDirectiveModule {}