#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { SingleProcessorStack } from '../lib/single-processor-stack';

const app = new cdk.App();

new SingleProcessorStack(app, 'SingleProcessorStack');
