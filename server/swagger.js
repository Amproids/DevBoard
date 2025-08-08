const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        // Note: Correct spelling is "definition" not "defentitions"
        openapi: '3.0.0',
        info: {
            title: 'DevBoard API',
            version: '1.0.0',
            description: 'A development board task manager API',
            license: {
                name: 'MIT'
            },
            contact: {
                name: 'API Support',
                email: 'support@devboard.com'
            },
            externalDocs: {
                description: 'Find more info on GitHub',
                url: 'https://github.com/Amproids/DevBoard'
            }
        },
        servers: [
            {
                url: 'http://localhost:5173',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Board: {
                    type: 'object',
                    required: ['name', 'owner'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        name: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 50
                        },
                        description: {
                            type: 'string',
                            maxLength: 200
                        },
                        owner: {
                            $ref: '#/components/schemas/UserRef'
                        },
                        members: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/BoardMember'
                            }
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        },
                        lockedColumns: {
                            type: 'boolean',
                            default: false
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                UserRef: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        firstName: {
                            type: 'string'
                        },
                        lastName: {
                            type: 'string'
                        },
                        email: {
                            type: 'string'
                        },
                        avatar: {
                            type: 'string'
                        }
                    }
                },
                BoardMember: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/UserRef'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'member']
                        }
                    }
                },
                User: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'email'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        firstName: {
                            type: 'string',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        displayName: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        avatar: {
                            type: 'string',
                            example: 'https://example.com/avatar.jpg'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                UserRegisterInput: {
                    type: 'object',
                    required: [
                        'firstName',
                        'lastName',
                        'email',
                        'password',
                        'confirmPassword'
                    ],
                    properties: {
                        firstName: {
                            type: 'string',
                            minLength: 1,
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            minLength: 1,
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            example: 'password123'
                        },
                        confirmPassword: {
                            type: 'string',
                            minLength: 6,
                            example: 'password123'
                        }
                    }
                },
                UserUpdateInput: {
                    type: 'object',
                    properties: {
                        firstName: {
                            type: 'string',
                            example: 'John'
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            example: 'newpassword123'
                        },
                        currentPassword: {
                            type: 'string',
                            example: 'oldpassword123'
                        },
                        avatar: {
                            type: 'string',
                            example: 'https://example.com/new-avatar.jpg'
                        }
                    }
                },
                Invitation: {
                    type: 'object',
                    required: [
                        'email',
                        'board',
                        'token',
                        'expiresAt',
                        'invitedBy'
                    ],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        board: {
                            type: 'string',
                            format: 'objectId',
                            description: 'Reference to Board'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'editor', 'viewer'],
                            default: 'editor'
                        },
                        token: {
                            type: 'string',
                            description: 'Unique invitation token'
                        },
                        expiresAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'accepted', 'rejected'],
                            default: 'pending'
                        },
                        invitedBy: {
                            type: 'string',
                            format: 'objectId',
                            description: 'User who sent the invitation'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                InvitationInput: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'editor', 'viewer'],
                            default: 'editor'
                        }
                    }
                },
                InvitationListResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean'
                        },
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Invitation'
                            }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                total: {
                                    type: 'integer'
                                },
                                page: {
                                    type: 'integer'
                                },
                                limit: {
                                    type: 'integer'
                                },
                                totalPages: {
                                    type: 'integer'
                                }
                            }
                        }
                    }
                },
                Column: {
                    type: 'object',
                    required: ['name', 'board', 'order'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        name: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 50,
                            example: 'To Do'
                        },
                        board: {
                            type: 'string',
                            format: 'objectId',
                            description: 'Reference to Board'
                        },
                        order: {
                            type: 'integer',
                            minimum: 0,
                            example: 0
                        },
                        tasks: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'objectId'
                            },
                            description: 'Array of task IDs'
                        },
                        isLocked: {
                            type: 'boolean',
                            default: false
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                ColumnInput: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 50,
                            example: 'In Progress'
                        },
                        isLocked: {
                            type: 'boolean',
                            default: false
                        }
                    }
                },
                ColumnUpdateInput: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 50,
                            example: 'Done'
                        },
                        order: {
                            type: 'integer',
                            minimum: 0,
                            example: 2
                        },
                        isLocked: {
                            type: 'boolean',
                            example: true
                        },
                        taskOrder: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'objectId'
                            },
                            description: 'New order of task IDs'
                        }
                    }
                },
                ColumnDeleteInput: {
                    type: 'object',
                    required: ['action'],
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['delete-tasks', 'move-tasks'],
                            example: 'move-tasks'
                        },
                        targetColumnId: {
                            type: 'string',
                            format: 'objectId',
                            description: 'Required when action is "move-tasks"'
                        }
                    }
                },
                ColumnLockInput: {
                    type: 'object',
                    required: ['isLocked'],
                    properties: {
                        isLocked: {
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                ColumnsResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                boardLocked: {
                                    type: 'boolean',
                                    description:
                                        'Indicates if board has locked columns'
                                },
                                columns: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Column'
                                    }
                                }
                            }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                count: {
                                    type: 'integer'
                                },
                                filters: {
                                    type: 'object',
                                    properties: {
                                        applied: {
                                            type: 'object'
                                        },
                                        available: {
                                            type: 'object'
                                        }
                                    }
                                },
                                sort: {
                                    type: 'object',
                                    properties: {
                                        applied: {
                                            type: 'string'
                                        },
                                        available: {
                                            type: 'array',
                                            items: {
                                                type: 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        message: {
                            type: 'string'
                        }
                    }
                },
                Task: {
                    type: 'object',
                    required: ['title', 'column', 'board', 'createdBy'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        title: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 100,
                            example: 'Implement user authentication'
                        },
                        description: {
                            type: 'string',
                            maxLength: 500,
                            example:
                                'Set up JWT authentication for API endpoints'
                        },
                        column: {
                            type: 'string',
                            format: 'objectId',
                            description: 'Reference to Column'
                        },
                        board: {
                            type: 'string',
                            format: 'objectId',
                            description: 'Reference to Board'
                        },
                        assignees: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/UserRef'
                            }
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Task deadline'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                            default: 'medium'
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string',
                                maxLength: 20
                            },
                            example: ['backend', 'auth']
                        },
                        createdBy: {
                            $ref: '#/components/schemas/UserRef'
                        },
                        completed: {
                            type: 'boolean',
                            default: false
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                TaskInput: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 100,
                            example: 'Create database schema'
                        },
                        description: {
                            type: 'string',
                            maxLength: 500,
                            example:
                                'Design MongoDB schema for users and boards'
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-12-31T23:59:59Z'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                            default: 'medium'
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string',
                                maxLength: 20
                            },
                            example: ['database', 'backend']
                        },
                        assignees: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'objectId'
                            },
                            description: 'Array of user IDs to assign'
                        },
                        order: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Position in column'
                        }
                    }
                },
                TaskUpdateInput: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 100,
                            example: 'Updated task title'
                        },
                        description: {
                            type: 'string',
                            maxLength: 500,
                            example: 'Updated description'
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-12-31T23:59:59Z'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high']
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string',
                                maxLength: 20
                            },
                            example: ['updated', 'tags']
                        },
                        assignees: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'objectId'
                            }
                        },
                        column: {
                            type: 'string',
                            format: 'objectId',
                            description: 'New column ID'
                        },
                        order: {
                            type: 'integer',
                            minimum: 0,
                            description: 'New position in column'
                        },
                        completed: {
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                MoveTaskInput: {
                    type: 'object',
                    required: ['targetColumnId', 'newOrder'],
                    properties: {
                        targetColumnId: {
                            type: 'string',
                            format: 'objectId',
                            description: 'ID of column to move to'
                        },
                        newOrder: {
                            type: 'integer',
                            minimum: 0,
                            description: 'New position in target column'
                        }
                    }
                },
                AssignTaskInput: {
                    type: 'object',
                    required: ['userId'],
                    properties: {
                        userId: {
                            type: 'string',
                            format: 'objectId',
                            description: 'User ID to assign'
                        }
                    }
                },
                TasksResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean'
                        },
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Task'
                            }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                count: {
                                    type: 'integer'
                                },
                                filters: {
                                    type: 'object',
                                    properties: {
                                        applied: {
                                            type: 'object'
                                        },
                                        available: {
                                            type: 'object'
                                        }
                                    }
                                },
                                sort: {
                                    type: 'object',
                                    properties: {
                                        applied: {
                                            type: 'string'
                                        },
                                        available: {
                                            type: 'array',
                                            items: {
                                                type: 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        message: {
                            type: 'string'
                        }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            example: 'password123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    $ref: '#/components/schemas/User'
                                },
                                token: {
                                    type: 'string',
                                    description: 'JWT token for authentication'
                                }
                            }
                        },
                        message: {
                            type: 'string'
                        }
                    }
                },
                OAuthResponse: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            description:
                                'JWT token returned as URL parameter after OAuth flow'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Boards',
                description: 'Board management endpoints'
            }
        ]
    },
    apis: [
        path.join(__dirname, './routes/*.js'),
        path.join(__dirname, './models/*.js')
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
