import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from './environment';
import { map, Observable } from 'rxjs';
import { QueryResponse } from '@shared/abstractions/grid-response.dto';
import { ClientManagmentDto } from '@core/domain/dtos/client-managment.dto';
import { ClientDto } from '../domain/dtos/client.dto';
import { ExtendedClient } from '@core/domain/models/extended-client';
import { ClientCreationRequestDto } from '@core/domain/dtos/client-creation-request.dto';

@Injectable()
export class ClientsService {
  readonly #http = inject(HttpClient);
  readonly #environment = inject(Environment);

  getAllClients(): Observable<QueryResponse<ExtendedClient>> {
    return this.#http.get<QueryResponse<ClientManagmentDto>>(`${this.#environment.apiUrl}/clients`, { withCredentials: true })
      .pipe(map(({ currentPage, items, rowsByPage, totalCount, totalPages }: QueryResponse<ClientManagmentDto>) => {
        return {
          items: items.map(({ client, deviceCount, userCount }: ClientManagmentDto) => {
            return new ExtendedClient(client, deviceCount, userCount);
          }),
          totalCount,
          totalPages,
          currentPage,
          rowsByPage,
        };
      }));
  }

  getClientById(id: string): Observable<ClientDto> {
    return this.#http.get<ClientDto>(`${this.#environment.apiUrl}/clients/${id}`, { withCredentials: true });
  }

  inactivateClient(id: string): Observable<void> {
    return this.#http.put<void>(`${this.#environment.apiUrl}/clients/${id}/inactive`, { withCredentials: true });
  }

  activateClient(id: string): Observable<void> {
    return this.#http.put<void>(`${this.#environment.apiUrl}/clients/${id}/active`, { withCredentials: true });
  }

  createClient(client: ClientCreationRequestDto): Observable<ClientDto> {
    return this.#http.post<ClientDto>(`${this.#environment.apiUrl}/clients`, client, { withCredentials: true });
  }

  updateClient(id: GUID, client: ClientCreationRequestDto): Observable<ClientDto> {
    return this.#http.put<ClientDto>(`${this.#environment.apiUrl}/clients/${id}`, client, { withCredentials: true });
  }
}
