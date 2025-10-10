pipeline {
    agent any
    stage('Test Node.js') {
				steps {
						sh 'node --version'
				}
		}
    tools {
        nodejs 'NodeJS_22'  // 匹配你的Node.js配置
    }
    
    parameters {
        booleanParam(name: 'REBUILD_IMAGES', defaultValue: true, description: '是否重新构建Docker镜像')
        booleanParam(name: 'RESTART_ONLY', defaultValue: false, description: '仅重启容器（不重新构建）')
    }
    
    stages {
        // 1. 拉取GitHub代码
        stage('拉取代码') {
            steps {
                echo "从GitHub拉取最新代码..."
                checkout scm
                sh 'git rev-parse --short HEAD > git-commit.txt'
                sh 'cat git-commit.txt'
            }
        }
        
        // 2. 构建前端项目（使用pnpm）
        stage('构建前端') {
            when {
                expression { return!params.RESTART_ONLY }
            }
            steps {
                dir('frontend') {
                    echo "安装pnpm..."
                    sh 'npm install -g pnpm'  // 全局安装pnpm
                    
                    echo "查看pnpm版本..."
                    sh 'pnpm -v'
                    
                    echo "安装前端依赖..."
                    sh 'pnpm install --registry=https://registry.npmmirror.com'  // 使用国内镜像
                    
                    echo "构建前端项目..."
                    sh 'pnpm run build'  // pnpm构建命令
                    
                    echo "检查构建结果..."
                    sh 'ls -l dist/'
                }
            }
        }
        
        // 3. 构建后端项目（使用yarn）
        stage('构建后端') {
            when {
                expression { return!params.RESTART_ONLY }
            }
            steps {
                dir('backend') {
                    echo "查看yarn版本..."
                    sh 'yarn -v'  // Node.js通常预装yarn，若没有会自动安装
                    
                    echo "安装后端依赖..."
                    sh 'yarn install --registry=https://registry.npmmirror.com'  // 使用国内镜像
                    
                    echo "检查.env文件..."
                    sh 'if [ -f ".env" ]; then cat.env; else echo "警告：未找到.env文件"; fi'
                    
                    echo "编译TypeScript代码..."
                    sh 'yarn run build'  // yarn编译命令
                    
                    echo "检查编译结果..."
                    sh 'ls -l dist/src/app.js'
                }
            }
        }
        
        // 4. 构建Docker镜像
        stage('构建Docker镜像') {
            when {
                expression { return params.REBUILD_IMAGES &&!params.RESTART_ONLY }
            }
            steps {
                script {
                    dir('frontend') {
                        echo "构建前端Docker镜像..."
                        sh 'docker build -t vue-frontend:latest.'
                        sh 'docker images | grep vue-frontend'
                    }
                    
                    dir('backend') {
                        echo "构建后端Docker镜像..."
                        sh 'docker build -t node-backend:latest.'
                        sh 'docker images | grep node-backend'
                    }
                }
            }
        }
        
        // 5. 部署容器服务
        stage('部署应用') {
            steps {
                script {
                    echo "停止当前运行的容器..."
                    sh 'docker-compose down || true'
                    
                    if (!params.RESTART_ONLY) {
                        echo "启动新容器..."
                        sh 'docker-compose up -d'
                    } else {
                        echo "仅重启容器..."
                        sh 'docker-compose up -d --no-recreate'
                    }
                    
                    echo "检查容器状态..."
                    sh 'docker-compose ps'
                }
            }
        }
        
        // 6. 健康检查
        stage('服务健康检查') {
            steps {
                script {
                    echo "检查前端服务..."
                    sh 'curl -s --head --fail http://localhost:80 || { echo "前端服务不可用"; exit 1; }'
                    
                    echo "检查后端服务..."
                    sh 'curl -s --head --fail http://localhost:3000/health || { echo "后端服务不可用"; exit 1; }'
                    
                    echo "检查数据库服务..."
                    sh 'docker exec app-mysql mysqladmin ping -h localhost -u root -prootpassword || { echo "数据库服务不可用"; exit 1; }'
                }
            }
        }
    }
    
    post {
        success {
            echo "=============================================="
            echo "部署成功！"
            echo "前端访问地址: http://43.136.87.130:80"
            echo "后端API地址: http://43.136.87.130:3000"
            echo "=============================================="
        }
        failure {
            echo "部署失败，请查看日志排查问题"
        }
    }
}
