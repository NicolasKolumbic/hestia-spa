import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-energy',
  imports: [CommonModule, FormsModule, ChartModule, SelectButtonModule, ProgressBarModule],
  templateUrl: './energy.html',
  styleUrl: './energy.css',
})
export class Energy implements OnInit {
  chartData: any;
  chartOptions: any;

  ranges = [
    { label: 'Día', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' }
  ];
  selectedRange = { label: 'Día', value: 'day' };

  topDevices = [
    { name: 'Aire Acondicionado (Living)', value: 1.2, percentage: 65, color: '#F06428', icon: 'pi-snowflake' }, // Naranja (Consumo alto)
    { name: 'Cargador Vehículo (EV)', value: 0.8, percentage: 40, color: '#3B82F6', icon: 'pi-car' }, // Azul
    { name: 'Lavadora / Secadora', value: 0.5, percentage: 25, color: '#14B8A6', icon: 'pi-cog' }, // Teal
    { name: 'Iluminación General', value: 0.2, percentage: 10, color: '#F59E0B', icon: 'pi-lightbulb' }, // Amarillo
  ];

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      datasets: [
        {
          label: 'Generación Solar',
          data: [0, 0, 1.5, 4.2, 3.8, 0.5, 0], // Curva solar típica
          fill: true,
          borderColor: '#EAB308', // Amarillo
          backgroundColor: 'rgba(234, 179, 8, 0.15)', // Amarillo transparente
          tension: 0.4
        },
        {
          label: 'Consumo Casa',
          data: [0.5, 0.4, 1.2, 1.5, 2.8, 3.5, 1.2], // Picos en la tarde/noche
          fill: false,
          borderColor: '#F06428', // Naranja Hestia
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }
}
