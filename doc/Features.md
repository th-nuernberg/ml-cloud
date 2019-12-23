1. Basic Requirements
    * Cloud based platform for training and inference of machine learning algorithms
    * User uploads custom datasets or choose from example datasets
    * Preview of uploadet or choosen datasets (like on kagle.com)
    * Common machine learning algorithms are available for selection
    * Configuration of multiple trainings with different hyperparameters
    * Save trained algorithms
    * Load different algorithms to resume training or for inference
    * Acces via webinterface or API call
2. Frontend
    * Dashboard with pendings jobs and their status
        * Pending jobs with status bar, ETA, best/average train/test accuracy/loss
        * Option to cancle pendig job
        * Select pending job and view detailed status and [hyperparameter configuration](https://gitlab.com/DrDOIS/it_projekt/wikis/parameter_configuration#hyper-parameters)
    * Add new jobs
        * List of available architektures
        * Short info on architectures on hover
        * Detailed info on architecture on selection
        * Configuration form for hyperparameter for selected architecture
            * Verify user input
        * List of available datasets or already uploadet datasets
    * Load trained model
        * Resume training with same or reconfigured hyperparameters
        * Inference on loadet model
    * Manage datasets
        * Upload dataset
        * Inspect dataset