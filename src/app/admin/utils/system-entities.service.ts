import { Injectable } from '@angular/core';
import { iSystemEntity } from 'src/app/models/entity-type.model';

@Injectable({
  providedIn: 'root',
})
export class SystemEntitiesService {
  constructor() {}

  systemEntities: iSystemEntity[] = [
    {
      displayName: 'sys.any',
      examples: [
        { request: 'Manuel' },
        { request: 'Perro' },
        { request: 'Casa' },
        { request: 'Globo' },
        { request: '235' },
      ],
    },
    {
      displayName: 'sys.date-time',
      examples: [
        { request: '2:30 pm' },
        { request: '13 de julio' },
        { request: 'abril' },
        { request: 'esta mañana' },
        { request: 'mañana a las 4:30 de la tarde' },
        { request: 'mañana por la tarde' },
      ],
    },
    { displayName: 'sys.date', examples: [{ request: 'mañana' }] },
    { displayName: 'sys.date-period', examples: [{ request: 'abril' }] },
    { displayName: 'sys.time', examples: [{ request: '2:30 pm' }] },
    { displayName: 'sys.time-period', examples: [{ request: 'tarde' }] },
    {
      displayName: 'sys.number',
      examples: [{ request: 'uno' }, { request: 'veinte' }],
    },
    {
      displayName: 'sys.unit-currency',
      examples: [{ request: '100 pesos' }, { request: '10 dólares' }],
    },
    {
      displayName: 'sys.percentage',
      examples: [{ request: '40%' }, { request: '50 por ciento' }],
    },
    {
      displayName: 'sys.duration',
      examples: [{ request: '15 minutos' }, { request: '5 días' }],
    },
    {
      displayName: 'sys.currency-name',
      examples: [
        { request: 'dólares' },
        { request: 'libras' },
        { request: 'pesos' },
      ],
    },
    {
      displayName: 'sys.address',
      examples: [
        { request: 'Plaza Pablo Ruiz Picasso, I Madrid 28020, España' },
      ],
    },
    {
      displayName: 'sys.zip-code',
      examples: [
        { request: '46011' },
        { request: '06000' },
        { request: 'X5003' },
      ],
    },
    {
      displayName: 'sys.geo-capital',
      examples: [{ request: 'París' }, { request: 'Bogotá' }],
    },
    {
      displayName: 'sys.geo-country',
      examples: [{ request: 'Colombia' }, { request: 'México' }],
    },
    {
      displayName: 'sys.geo-city',
      examples: [{ request: 'Nueva York' }, { request: 'Bogotá' }],
    },
    {
      displayName: 'sys.geo-state',
      examples: [{ request: 'Andalucía' }, { request: 'Jalisco' }],
    },
    {
      displayName: 'sys.location',
      examples: [
        { request: 'Plaza Pablo Ruiz Picasso, I' },
        { request: 'Madrid 28020, España' },
      ],
    },
    {
      displayName: 'sys.email',
      examples: [
        { request: 'user@example.com' },
        { request: 'example arroba gmail punto com' },
      ],
    },
    {
      displayName: 'sys.phone-number',
      examples: [
        { request: '(123) 456 7890' },
        { request: '+1 (123) 456-7890' },
      ],
    },
    {
      displayName: 'sys.given-name',
      examples: [{ request: 'Javier' }, { request: 'Rosa' }],
    },
    {
      displayName: 'sys.last-name',
      examples: [{ request: 'Martinez' }, { request: 'García' }],
    },
    {
      displayName: 'sys.person',
      examples: [
        { request: 'Rosa García' },
        { request: 'Rosa' },
        { request: 'García' },
      ],
    },
    {
      displayName: 'sys.music-artist',
      examples: [{ request: 'Beatles' }, { request: 'RHCP' }],
    },
    { displayName: 'sys.music-genre', examples: [{ request: 'Clásica' }] },
    {
      displayName: 'sys.color',
      examples: [{ request: 'magenta' }, { request: 'verde' }],
    },
    {
      displayName: 'sys.language',
      examples: [{ request: 'Japonés' }, { request: 'Inglés' }],
    },
    { displayName: 'sys.url', examples: [{ request: 'www.agentesmart.com' }] },
  ];
}
