import { TreeNode } from "primeng/api";
import { ScopeNodeData } from "../interfaces/scope-node-data.interface";
import { AccessUser } from "../interfaces/access-user.interface";

export const MOCK_SCOPE_TREE: TreeNode<ScopeNodeData>[] = [
    {
        key: 'client-familia-perez',
        label: 'Familia Pérez',
        expanded: true,
        data: {
            id: 'client-familia-perez',
            type: 'CLIENT',
            label: 'Cliente completo · Familia Pérez',
        },
        children: [
            {
                key: 'site-casa-rosario',
                label: 'Casa Rosario',
                expanded: true,
                data: {
                    id: 'site-casa-rosario',
                    type: 'SITE',
                    label: 'Sitio · Casa Rosario',
                },
                children: [
                    {
                        key: 'zone-living',
                        label: 'Living',
                        expanded: true,
                        data: {
                            id: 'zone-living',
                            type: 'ZONE',
                            label: 'Zona · Living · Casa Rosario',
                        },
                        children: [
                            {
                                key: 'device-light-living',
                                label: 'Luz Living',
                                data: {
                                    id: 'device-light-living',
                                    type: 'DEVICE',
                                    label: 'Dispositivo · Luz Living · Living',
                                },
                            },
                            {
                                key: 'device-camera-living',
                                label: 'Cámara Living',
                                data: {
                                    id: 'device-camera-living',
                                    type: 'DEVICE',
                                    label: 'Dispositivo · Cámara Living · Living',
                                },
                            },
                        ],
                    },
                    {
                        key: 'zone-patio',
                        label: 'Patio',
                        expanded: true,
                        data: {
                            id: 'zone-patio',
                            type: 'ZONE',
                            label: 'Zona · Patio · Casa Rosario',
                        },
                        children: [
                            {
                                key: 'device-light-patio',
                                label: 'Luz Patio',
                                data: {
                                    id: 'device-light-patio',
                                    type: 'DEVICE',
                                    label: 'Dispositivo · Luz Patio · Patio',
                                },
                            },
                            {
                                key: 'device-camera-gate',
                                label: 'Cámara Portón',
                                data: {
                                    id: 'device-camera-gate',
                                    type: 'DEVICE',
                                    label: 'Dispositivo · Cámara Portón · Patio',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                key: 'site-casa-funes',
                label: 'Casa Funes',
                expanded: true,
                data: {
                    id: 'site-casa-funes',
                    type: 'SITE',
                    label: 'Sitio · Casa Funes',
                },
                children: [
                    {
                        key: 'zone-quincho',
                        label: 'Quincho',
                        data: {
                            id: 'zone-quincho',
                            type: 'ZONE',
                            label: 'Zona · Quincho · Casa Funes',
                        },
                        children: [
                            {
                                key: 'device-light-quincho',
                                label: 'Luz Quincho',
                                data: {
                                    id: 'device-light-quincho',
                                    type: 'DEVICE',
                                    label: 'Dispositivo · Luz Quincho · Quincho',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const MOCK_USERS: AccessUser[] = [
    {
        id: 'user-1',
        fullName: 'Nicolás Kolumbic',
        email: 'nicolas@example.com',
        initials: 'NK',
        status: 'active',
        lastLoginAt: '2026-03-25 20:35',
        memberships: [
            {
                id: 'membership-1',
                clientId: 'client-familia-perez',
                clientName: 'Familia Pérez',
                status: 'active',
                invitedBy: 'Sistema',
                joinedAt: '2026-02-01',
                assignments: [
                    {
                        id: 'assignment-1',
                        role: 'owner',
                        scopeType: 'CLIENT',
                        scopeId: 'client-familia-perez',
                        scopeLabel: 'Cliente completo · Familia Pérez',
                    },
                ],
            },
        ],
    },
    {
        id: 'user-2',
        fullName: 'Brenda López',
        email: 'brenda@example.com',
        initials: 'BL',
        status: 'active',
        lastLoginAt: '2026-03-24 18:10',
        memberships: [
            {
                id: 'membership-2',
                clientId: 'client-familia-perez',
                clientName: 'Familia Pérez',
                status: 'active',
                invitedBy: 'Nicolás Kolumbic',
                joinedAt: '2026-02-05',
                assignments: [
                    {
                        id: 'assignment-2',
                        role: 'operator',
                        scopeType: 'ZONE',
                        scopeId: 'zone-living',
                        scopeLabel: 'Zona · Living · Casa Rosario',
                    },
                    {
                        id: 'assignment-3',
                        role: 'viewer',
                        scopeType: 'CLIENT',
                        scopeId: 'client-familia-perez',
                        scopeLabel: 'Cliente completo · Familia Pérez',
                    },
                ],
            },
        ],
    },
    {
        id: 'user-3',
        fullName: 'Carlos Seguridad',
        email: 'cseguridad@example.com',
        initials: 'CS',
        status: 'active',
        lastLoginAt: '2026-03-25 07:52',
        memberships: [
            {
                id: 'membership-3',
                clientId: 'client-familia-perez',
                clientName: 'Familia Pérez',
                status: 'active',
                invitedBy: 'Nicolás Kolumbic',
                joinedAt: '2026-03-01',
                assignments: [
                    {
                        id: 'assignment-4',
                        role: 'security_monitor',
                        scopeType: 'SITE',
                        scopeId: 'site-casa-rosario',
                        scopeLabel: 'Sitio · Casa Rosario',
                    },
                ],
            },
        ],
    },
    {
        id: 'user-4',
        fullName: 'Técnico Instalador',
        email: 'tecnico@example.com',
        initials: 'TI',
        status: 'pending',
        lastLoginAt: null,
        memberships: [
            {
                id: 'membership-4',
                clientId: 'client-familia-perez',
                clientName: 'Familia Pérez',
                status: 'pending',
                invitedBy: 'Nicolás Kolumbic',
                joinedAt: '2026-03-25',
                assignments: [
                    {
                        id: 'assignment-5',
                        role: 'technician',
                        scopeType: 'DEVICE',
                        scopeId: 'device-camera-gate',
                        scopeLabel: 'Dispositivo · Cámara Portón · Patio',
                    },
                ],
            },
        ],
    },
];