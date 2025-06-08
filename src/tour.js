export function initTour() {
    const driver = new Driver();

    const steps = [
        {
            element: '.pattern-section',
            popover: {
                title: 'Patrones',
                description: 'Elige un patrón para practicar',
                position: 'right'
            }
        },
        {
            element: '.pattern-info-panel',
            popover: {
                title: 'Información',
                description: 'Aquí verás los detalles del patrón',
                position: 'right'
            }
        },
        {
            element: '.start-pattern-btn',
            popover: {
                title: 'Comenzar',
                description: 'Presiona para iniciar la práctica',
                position: 'right'
            }
        }
    ];

    driver.defineSteps(steps);
    driver.start();
} 