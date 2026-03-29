import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('health')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({
        status: 200,
        description: 'API está funcionando corretamente',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'SeedaBit NestJS Template API' },
                version: { type: 'string', example: '1.0.0' },
                timestamp: {
                    type: 'string',
                    example: '2025-10-24T10:30:00.000Z',
                },
            },
        },
    })
    getHealth() {
        return this.appService.getHealth()
    }
}
