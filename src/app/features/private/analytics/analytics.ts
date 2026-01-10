import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, FormsModule, ChartModule, DatePickerModule, ButtonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {
  dateRange: Date[] | undefined;

  comboData: any;
  comboOptions: any;

  radarData: any;
  radarOptions: any;

  ngOnInit() {
    this.initCharts();
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // 1. COMBO CHART: Temperatura vs Uso de AC
    this.comboData = {
      labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      datasets: [
        {
          type: 'line',
          label: 'Temp. Exterior (°C)',
          borderColor: '#F97316', // Naranja
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          data: [28, 29, 33, 31, 25, 24, 30]
        },
        {
          type: 'bar',
          label: 'Uso AC (Horas)',
          backgroundColor: 'rgba(139, 92, 246, 0.5)', // Púrpura con transparencia
          borderColor: '#8B5CF6',
          borderWidth: 1,
          data: [4, 5, 8, 6, 2, 1, 5]
        }
      ]
    };

    this.comboOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: { display: false }, // Ocultamos leyenda default para usar la nuestra custom
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false },
          title: { display: true, text: 'Horas / °C' }
        }
      }
    };

    // 2. RADAR CHART: Ocupación por Habitación
    this.radarData = {
      labels: ['Sala', 'Cocina', 'Dormitorio', 'Oficina', 'Jardín'],
      datasets: [
        {
          label: 'Día (08:00 - 20:00)',
          borderColor: '#14B8A6', // Teal
          backgroundColor: 'rgba(20, 184, 166, 0.2)',
          pointBackgroundColor: '#14B8A6',
          data: [65, 59, 20, 81, 56]
        },
        {
          label: 'Noche (20:00 - 08:00)',
          borderColor: '#6366F1', // Indigo
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          pointBackgroundColor: '#6366F1',
          data: [80, 20, 90, 10, 5]
        }
      ]
    };

    this.radarOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        r: {
          grid: { color: surfaceBorder },
          pointLabels: { color: textColorSecondary },
          ticks: { display: false } // Limpia los números del radar
        }
      }
    };
  }
}
