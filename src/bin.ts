#!/usr/bin/env node
import { FrameworkCLI } from "./cli";

const args = process.argv.slice(2);
FrameworkCLI.run(args);


