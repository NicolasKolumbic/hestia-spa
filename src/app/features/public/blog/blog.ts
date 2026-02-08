import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-blog',
  imports: [CommonModule, ButtonModule, InputTextModule, TagModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog {
  activeCategory = 'all';

  categories = [
    { id: 'all', label: 'Ver Todo' },
    { id: 'tutorials', label: 'Guías y Tutoriales' },
    { id: 'tech', label: 'Ingeniería & Seguridad' },
    { id: 'lifestyle', label: 'Estilo de Vida' },
    { id: 'updates', label: 'Novedades Hestia' }
  ];

  featuredPost = {
    title: '¿Por qué el procesamiento local (Edge) es el futuro de la privacidad?',
    excerpt: 'Analizamos las diferencias críticas entre enviar tus videos a la nube vs. procesarlos en tu propio hogar. Lo que las grandes tecnológicas no te cuentan.',
    image: 'assets/blog-privacy.jpg', // Placeholder
    category: 'Ingeniería',
    readTime: '8 min',
    author: 'Alejandro Sartorio',
    role: 'Lead Architect',
    date: '12 Oct, 2024'
  };

  posts = [
    {
      id: 1,
      title: '5 Rutinas de iluminación para mejorar tu sueño',
      excerpt: 'Cómo configurar los ciclos circadianos en Hestia para despertar con energía y dormir más rápido.',
      image: 'assets/blog-sleep.jpg',
      category: 'Estilo de Vida',
      readTime: '4 min',
      author: 'Equipo Hestia',
      date: '08 Oct, 2024'
    },
    {
      id: 2,
      title: 'Ahorra hasta un 30% en calefacción este invierno',
      excerpt: 'Guía práctica para configurar tus termostatos inteligentes y sensores de ventana.',
      image: 'assets/blog-energy.jpg',
      category: 'Tutoriales',
      readTime: '6 min',
      author: 'Matias Banega',
      date: '01 Oct, 2024'
    },
    {
      id: 3,
      title: 'Matter 1.2: Qué cambia para tus dispositivos',
      excerpt: 'El nuevo estándar de interoperabilidad ya está aquí. Te explicamos cómo Hestia lo integra.',
      image: 'assets/blog-matter.jpg',
      category: 'Ingeniería',
      readTime: '5 min',
      author: 'Nicolás Kolumbic',
      date: '28 Sep, 2024'
    }
  ];

  get filteredPosts() {
    // Lógica simple de filtrado (en una app real iría contra backend)
    return this.activeCategory === 'all'
      ? this.posts
      : this.posts.filter(p => p.category.toLowerCase().includes(this.activeCategory)); // Simplificado
  }
}
