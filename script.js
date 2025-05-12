document.addEventListener('DOMContentLoaded', () => {
    // Comprehensive data source for all potential nodes
    const allNodesData = {
        1: { id: 1, label: 'Knowledge', title: 'Root: All Knowledge', level: 0, childIds: [2, 3], expanded: false },
        2: { id: 2, label: 'Science', title: 'Category: Science', level: 1, childIds: [4, 5], expanded: false },
        3: { id: 3, label: 'Humanities', title: 'Category: Humanities', level: 1, childIds: [6, 7], expanded: false },
        4: { id: 4, label: 'Physics', title: 'Field: Physics', level: 2, childIds: [8, 9], expanded: false },
        5: { id: 5, label: 'Biology', title: 'Field: Biology', level: 2, childIds: [10], expanded: false },
        6: { id: 6, label: 'History', title: 'Field: History', level: 2, childIds: [], expanded: false },
        7: { id: 7, label: 'Literature', title: 'Field: Literature', level: 2, childIds: [], expanded: false },
        8: { id: 8, label: 'Classical Mechanics', title: 'Subfield: Classical Mechanics', level: 3, childIds: [], expanded: false },
        9: { id: 9, label: 'Quantum Mechanics', title: 'Subfield: Quantum Mechanics', level: 3, childIds: [], expanded: false },
        10: { id: 10, label: 'Genetics', title: 'Subfield: Genetics', level: 3, childIds: [], expanded: false }
    };

    // Initial node (root)
    const initialNode = JSON.parse(JSON.stringify(allNodesData[1])); // Deep copy
    delete initialNode.childIds; // childIds is not a vis.js node property
    delete initialNode.expanded; // expanded is not a vis.js node property

    const nodes = new vis.DataSet([initialNode]);
    const edges = new vis.DataSet([]);

    // Get the container element
    const container = document.getElementById('knowledgeGraph');

    // Provide the data in the vis format
    const data = {
        nodes: nodes,
        edges: edges,
    };

    const options = {
        layout: {
            hierarchical: {
                enabled: true,
                levelSeparation: 150,
                nodeSpacing: 150, // Increased for better spacing
                treeSpacing: 200,
                direction: 'UD', // Up-Down
                sortMethod: 'directed',
            },
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
            hover: true, // Show title on hover
        },
        physics: {
            enabled: false,
        },
        nodes: {
            shape: 'box',
            margin: 10,
            widthConstraint: { minimum: 100, maximum: 200 },
            font: {
                size: 14,
                multi: 'html', // Allow HTML in labels if needed later
            },
            borderWidth: 1,
            shadow: true,
        },
        edges: {
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'vertical',
                roundness: 0.4,
            },
            arrows: 'to',
            color: {
                color: '#848484',
                highlight: '#848484',
                hover: '#848484',
            }
        },
    };

    // Initialize the network!
    const network = new vis.Network(container, data, options);

    network.on('click', function (params) {
        if (params.nodes.length > 0) {
            const clickedNodeId = params.nodes[0];
            const nodeData = allNodesData[clickedNodeId];

            if (nodeData && !nodeData.expanded && nodeData.childIds && nodeData.childIds.length > 0) {
                const newNodesToAdd = [];
                const newEdgesToAdd = [];

                nodeData.childIds.forEach(childId => {
                    if (!nodes.get(childId)) { // Check if node already exists
                        const childNodeDefinition = allNodesData[childId];
                        if (childNodeDefinition) {
                            // Prepare a clean node object for vis.js
                            const visNode = { 
                                id: childNodeDefinition.id, 
                                label: childNodeDefinition.label, 
                                title: childNodeDefinition.title, 
                                level: childNodeDefinition.level 
                            };
                            newNodesToAdd.push(visNode);
                            newEdgesToAdd.push({ from: clickedNodeId, to: childId });
                        }
                    }
                });

                if (newNodesToAdd.length > 0) {
                    nodes.add(newNodesToAdd);
                }
                if (newEdgesToAdd.length > 0) {
                    edges.add(newEdgesToAdd);
                }
                
                // Mark as expanded in our source data
                allNodesData[clickedNodeId].expanded = true; 
            }
        }
    });
}); 